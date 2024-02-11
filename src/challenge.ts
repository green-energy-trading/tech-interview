interface User {
  id: string;
  name: string;
  role: UserRole;
}

enum UserRole {
  ADMIN = "admin",
  MANAGER = "manager",
  EMPLOYEE = "employee",
}

export class SignatureRequest {
  constructor (public id: string, public documentId: string) {}

  requiredSignatures: SignatureRequirement[] = [];
  signatures: Signature[] = [];

  findRequiredSignature(userId: string): SignatureRequirement | undefined {
    return this.requiredSignatures.find(req => req.userId === userId);
  }

  isPrerequisiteSigned(condition: SignatureCondition): boolean {
    return this.signatures.some(sig => sig.signatureId === condition.prerequisiteSignatureId);
  }
}

interface SignatureRequirement {
  userId: string;
  role: UserRole;
  type: SignatureType;
  condition?: SignatureCondition;
}

enum SignatureType {
  DIGITAL = "digital",
  HANDWRITTEN = "handwritten",
}

interface SignatureCondition {
  prerequisiteSignatureId?: string;
  conditionType: "NOT_REQUIRED_IF_SIGNED";
}

interface Signature {
  userId: string;
  signatureId: string;
  type: SignatureType;
  imageData?: string; // Base64 encoded image for handwritten signatures
  timestamp: Date;
}

export class SignatureService extends Array<SignatureRequest> {

  constructor(requests: SignatureRequest[]) {
    super();
    for (const request of requests) {
      this.push(request);
    }
  }

  addSignature(signature: Signature, id: string): boolean {
    const request = this.findById(id)
    if (!request) return false;

    // Check if signature meets any conditions
    const requirement = request.findRequiredSignature(signature.userId)
    if (!requirement) return false;

    if (requirement.condition && requirement.condition.prerequisiteSignatureId) {
      const prerequisiteSigned = request.isPrerequisiteSigned(requirement.condition)
      if (prerequisiteSigned && requirement.condition.conditionType === "NOT_REQUIRED_IF_SIGNED") return false;
    }

    request.signatures.push(signature);
    return true;
  }

  findById(id: string): SignatureRequest | undefined {
    return this.find(req => req.id === id);
  }

  findAllByDocumentId(documentId: string): SignatureRequest[] {
    return this.filter(req => req.documentId === documentId);
  }
}
