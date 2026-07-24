export class ItemEntity {
  constructor(
    public readonly id: string,
    public name: string,
    public stockGudang: number,
    public stockEtalase: number,
    public asal: string,
    public createdAt?: Date,
    public updatedAt?: Date,
  ) {}

  public hasEnoughGudangStock(amount: number): boolean {
    return this.stockGudang >= amount;
  }

  public hasEnoughEtalaseStock(amount: number): boolean {
    return this.stockEtalase >= amount;
  }
}
