import React, {
  ChangeEvent,
  FocusEventHandler,
  ReactNode,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { TextField } from '@material-ui/core';
import FormLabel from '@material-ui/core/FormLabel';
import { Alert } from '@material-ui/lab';
import Grid from '@material-ui/core/Grid';
import { makeStyles, Theme, alpha } from '@material-ui/core/styles';


const MIN_SERIAL_NUMBERS = 1;
const MAX_SERIAL_NUMBERS = 500;

const useStyles = makeStyles<Theme>(theme => {
  const lightWarningColor = alpha(theme.palette.warning.light, 0.2);
  const lightInfoColor = alpha(theme.palette.info.light, 0.2);

  return {
    duplicated: {
      backgroundColor: lightWarningColor,
    },
    extra: {
      backgroundColor: lightInfoColor,
    },
    duplicatedExtra: {
      backgroundImage: `repeating-linear-gradient(135deg, ${lightWarningColor}, ${lightWarningColor} 15px, ${lightInfoColor} 15px, ${lightInfoColor} 30px)`,
    },
  };
});

interface SerialNumberInputProps {
  value?: string[];
  label?: ReactNode;
  helperText?: string;
  error: boolean;
  expectedCount: number;
  readOnly: boolean;
  onConfirm: (nextValue: string[]) => void;
}

export const SerialNumberInput: React.FC<SerialNumberInputProps> = ({
  value: initialValue = [],
  label,
  expectedCount,
  readOnly,
  error,
  helperText,
  onConfirm,
}) => {
  const filteredInitialValue = initialValue.filter(Boolean);
  const classes = useStyles();
  const [value, setValue] = useState<string[]>(filteredInitialValue);

  // EFFECTS

  const filteredInitialValueDependency = filteredInitialValue.toString();
  useEffect(() => {
    setValue(filteredInitialValue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredInitialValueDependency]);

  // HANDLERS

  const handleTextFieldChange = useCallback(
    (
      event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
      index: number
    ) => {
      const nextValue = event.target.value;
      setValue(prevValue => {
        const values = prevValue.slice();
        values[index] = nextValue;
        return values;
      });
    },
    []
  );

  const handleTextFieldBlur = useCallback(() => {
    onConfirm(value.filter(Boolean));
  }, [onConfirm, value]);

  // RENDER

  let inputs: JSX.Element[] = [];

  const errorMessage = error ? helperText : undefined;
  const actualCount = value.length;
  let count = actualCount > expectedCount ? actualCount : expectedCount;
  const extraValues = actualCount - expectedCount;
  let duplicateCount = 0;

  const seen = new Map();

  // Failsafe to prevent crashing the browser
  const isCountAboveMax = count > MAX_SERIAL_NUMBERS;
  const originalCount = count;
  if (isCountAboveMax) {
    count = MAX_SERIAL_NUMBERS;
  }
  if (count < MIN_SERIAL_NUMBERS) {
    count = MIN_SERIAL_NUMBERS;
  }

  for (let index = 0; index < count; index++) {
    // Cannot be null or undefined.
    const currentValue = value[index] ?? '';
    const isDuplicated = currentValue && seen.has(currentValue);
    const isExtra = index + 1 > expectedCount;

    seen.set(currentValue, true);

    let className;

    if (isDuplicated && isExtra) {
      className = classes.duplicatedExtra;
    } else if (isDuplicated) {
      className = classes.duplicated;
    } else if (index + 1 > expectedCount) {
      className = classes.extra;
    }

    if (isDuplicated) {
      duplicateCount++;
    }

    inputs.push(
      <Grid item key={index}>
        <TextField
          variant="outlined"
          size="small"
          className={className}
          disabled={readOnly}
          value={currentValue}
          error={error}
          onChange={event => handleTextFieldChange(event, index)}
          onBlur={handleTextFieldBlur}
        />
      </Grid>
    );
  }

  return (
    <>
      <FormLabel
        error={error}
        disabled={readOnly}
        style={{ display: 'block', marginBottom: 8 }}
      >
        {label}
      </FormLabel>
      {isCountAboveMax ? (
        <Alert style={{ marginBottom: 10 }} severity="error">
          Expected to receive {originalCount} serial numbers, but the max is{' '}
          {MAX_SERIAL_NUMBERS}.
        </Alert>
      ) : null}
      {error ? (
        <Alert style={{ marginBottom: 10 }} severity="error" icon={false}>
          {errorMessage}
        </Alert>
      ) : null}
      {duplicateCount > 0 ? (
        <Alert style={{ marginBottom: 10 }} severity="warning" icon={false}>
          There {duplicateCount === 1 ? 'is' : 'are'} {duplicateCount}{' '}
          duplicated serial {pluralize('number', duplicateCount > 1)}.
        </Alert>
      ) : null}
      {extraValues > 0 ? (
        <Alert style={{ marginBottom: 10 }} severity="info" icon={false}>
          There {extraValues === 1 ? 'is' : 'are'} {extraValues} more serial
          {pluralize('number', duplicateCount > 1)} than expected.
        </Alert>
      ) : null}

      <Grid container spacing={1}>
        {inputs}
      </Grid>
    </>
  );
};

interface SerialNumberProps {
  expectedCount: number;
  onBlur?: FocusEventHandler<HTMLDivElement>;
}

export default FormInput<SerialNumberProps & FormInputProps>(
  (props: ResolvedProps & SerialNumberProps) => {
    const { onChange, expectedCount, onBlur, ...rest } = props;

    return (
      <div onBlur={onBlur}>
        <SerialNumberInput
          onConfirm={onChange}
          expectedCount={expectedCount}
          {...rest}
        />
      </div>
    );
  }
);

interface FormInputProps {
  error: boolean;
  readOnly: boolean;
  onChange: (value: any) => void;
}

interface ResolvedProps {
  error: boolean;
  readOnly: boolean;
  onChange: (value: any) => void;
}

function FormInput<T>(Component: React.FC<T>) {
  return Component;
}

/**
 * Turns the word into its plural variant or leaves it singular.
 *
 * @example
 * pluralize('car', 5)
 * // => cars
 * pluralize('car', 0)
 * // => car
 * pluralize('bus', true, 'es')
 * // => buses
 * pluralize('activit', true, 'ies', 'y')
 * // => activities
 *
 * @param root Word root (e.g. "car").
 * @param isPlural Either bool or number of occurrences.
 * @param pluralSuffix Default is "s".
 * @param singularSuffix Used for irregular words.
 */
export function pluralize(root: string, isPlural: boolean | number, pluralSuffix: string = 's', singularSuffix: string = ''): string {
  if(isPlural === 1 || isPlural === false) {
    return root + singularSuffix;
  }

  return root + pluralSuffix;
}
