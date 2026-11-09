export class GetMaterialsQuery {
  constructor(
    public readonly userId: string,
    public readonly roles: string[],
  ) {}
}

export class GetMaterialQuery {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly roles: string[],
  ) {}
}
