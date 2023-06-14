export interface smokeReading {
    device_id: string,
    smoke_read: number,
    time: number,
}

export enum STATUS {
    GREEN,
    ORANGE,
    RED,
    BLACK,
    RECON,
    SMS,
    FIRE,
}

export interface sensorHealth {
    status: STATUS,
    device_id: string,
    time: number,
}
