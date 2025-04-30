import { DomainException } from "../../shared/exception";

export class ParticipationNotFoundException extends DomainException {
  constructor() {
    super("No participation found");
  }
}
