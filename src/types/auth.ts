declare global {
  namespace Express {
    interface Request {
      user: IUser
    }
  }
}

declare module "socket.io" {
  interface Socket {
    user: IUser
  }
}

export interface IUser {
  id: string
  username: string | null
  email: string | null
  publicAddress: string
  balance: number
  nonce: number
}
