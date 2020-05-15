export interface ISignUp{
    username: string
    email: string
    password: string
}

export interface IUsersDB{
    id: string
    username: string
    email: string
    password: string
    verification_hash: string
}

export interface ISimpleUser{
    id: string
    username: string
    email: string
}

export interface ISignUpFromDB{
    id: string
    username: string
    email: string
    password: string
    verification_hash: string
}

export interface ISignUpAdapted{
    id: string
    username: string
    email: string
}

export interface IChangePassword{
    password: string
    hash: string
}