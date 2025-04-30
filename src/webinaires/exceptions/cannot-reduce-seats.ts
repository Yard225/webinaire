import { DomainException } from "../../shared/exception";

export class CannotReduceSeatsException extends DomainException {
  constructor() {
    super("You cannot reduce number of seats");
  }
}
