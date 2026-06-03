import { defineModule } from "../types";

export default defineModule({
    id: 'api',
    name: 'api',
});

export * from './request';
export * from './novel';
