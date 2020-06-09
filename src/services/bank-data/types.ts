export interface IBrazilBanksFromDb{
    id: string
    name: string
    code: string
    created_at: Date
    updated_at: Date
}

export interface IUserBankValuesFromDb{
    id: string
    name: string
    agency: string
    account: string
    account_digit: string
    document: string
    brazil_bank_id: string
    created_at: Date
    updated_at: Date
}

export interface IUserBankValuesToInsert{
    name: string
    agency: string
    account: string
    accountDigit: string
    document: string
    brazilBankId: string
}