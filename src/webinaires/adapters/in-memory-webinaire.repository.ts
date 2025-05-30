import { Webinaire } from "../entities/webinaire.entity";
import { IWebinaireRepository } from "../ports/webinaire-repository.interface";

export class InMemoryWebinaireRepository implements IWebinaireRepository {
  constructor(public database: Webinaire[] = []) {}

  async findById(id: string): Promise<Webinaire | null> {
    return this.findByIdSync(id);
  }

  findByIdSync(id: string): Webinaire | null {
    const webinaire = this.database.find((w) => w.props.id === id);
    return webinaire ? new Webinaire({ ...webinaire.initialState }) : null;
  }

  async createWebinaire(webinaire: Webinaire): Promise<void> {
    this.database.push(webinaire);
  }

  async update(webinaire: Webinaire): Promise<void> {
    const index = this.database.findIndex(
      (w) => w.props.id === webinaire.props.id
    );
    this.database[index] = webinaire;
    webinaire.commit();
  }

  async delete(webinaire: Webinaire): Promise<void> {
    const index = this.database.findIndex(
      (w) => w.props.id === webinaire.props.id
    );

    this.database.splice(index, 1);
  }
}
