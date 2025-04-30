import { DomainException } from "../../shared/exception";

export class WebinaireNoSeatsException extends DomainException {
    constructor(){
        super("Le nombre de place au webinaire soit être de minimum 1 place")
    }
}