// file: ~/server/api/token.get.ts
import { getToken } from "#auth";

export default eventHandler(event => getToken({ event }));
