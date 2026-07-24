export class LogEntity {
  constructor(
    public readonly id: string,
    public itemId?: string,
    public itemName?: string,
    public type?: string, // 'input' | 'pengurangan' | 'mutasi' | 'penjualan' | 'transfer'
    public jumlah?: number,
    public asal?: string,
    public tujuan?: string,
    public createdAt?: Date,
    public updatedAt?: Date,
  ) {}
}
