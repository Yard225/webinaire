import { DomainException } from "../../shared/exception";

export class AlreadyParticipateToWebinaireException extends DomainException {
  constructor() {
    super("You are already participate in this webinaire");
  }
}
