export abstract class Entity<TType> {
  public initialState: TType;
  public props: TType;

  constructor(data: TType) {
    this.initialState = { ...data };
    this.props = { ...data };

    Object.freeze(this.initialState);
  }

  update(data: Partial<TType>) {
    this.props = { ...this.props, ...data };
  }

  commit() {
    this.initialState = this.props;
  }
}
