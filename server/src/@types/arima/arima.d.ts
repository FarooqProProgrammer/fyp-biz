declare module "timeseries-analysis" {
    export default class TS {
        constructor(data?: [number, number][]);
        main(data: [number, number][]): this;
        ma(options: { period: number }): this;
        output(): [number, number][];
    }
}
