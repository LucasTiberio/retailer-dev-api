export interface ISignIn{
    email: string
    password: string
}

export interface ISignInAdapted{
    id: string
    username: string
    email: string
}

export interface IUserToken{
    origin: string
    id: string
}