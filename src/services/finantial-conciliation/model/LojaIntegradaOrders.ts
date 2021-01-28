import mongoose, { Schema, Document } from 'mongoose'
import { PlugOneAffiliateStatus } from '../types'

interface AffiliateInfo {
  commission?: AffiliateCommission
  affiliateId: string
}

interface AffiliateCommission {
  amount: number
}

interface ILojaIntegradaAffiliateOrders extends Document {
  externalId: string
  type: string
  plugoneAffiliateStatus: PlugOneAffiliateStatus
  affiliateId: string
  affiliateInfo: AffiliateInfo
  cliente: LojaIntegradaCustomer
  cupom_desconto: string
  utm_campaign: string
  data_criacao: string
  data_expiracao: string
  data_modificacao: string
  itens: LojaIntegradaItem[]
  numero: number
  situacao: IOrderSituation
  valor_desconto: string
  valor_envio: string
  valor_subtotal: string
  valor_total: string
  isPaid: boolean
}

interface IOrderSituation {
  aprovado: boolean
  cancelado: boolean
  codigo: string
  final: boolean
  id: number
  nome: string
  notificar_comprador: boolean
  padrao: boolean
  resource_uri: string
}

interface LojaIntegradaItem {
  altura: string
  disponibilidade: number
  id: number
  largura: string
  linha: number
  nome: string
  pedido: string
  peso: string
  preco_cheio: string
  preco_custo: string
  preco_promocional: string
  preco_subtotal: string
  preco_venda: string
  produto: string
  produto_pai: string
  profundidade: string
  quantidade: string
  sku: string
  tipo: string
}

interface LojaIntegradaCustomer {
  cnpj: string
  cpf: string
  data_nascimento: string
  email: string
  id: number
  nome: string
  razao_social: string
  resource_uri: string
  sexo: string
  telefone_celular: string
  telefone_principal: string
}

const LojaIntegradaAffiliateOrders: Schema = new Schema({
  externalId: { type: String, required: true },
  type: { type: String, required: true },
  affiliateInfo: { type: Object, required: true },
  cliente: { type: Object, required: true },
  itens: { type: Object, required: true },
  situacao: { type: Object, required: true },
  data_criacao: { type: Date, required: true },
  numero: { type: Number, required: true },
  valor_desconto: { type: String, required: true },
  valor_envio: { type: String, required: true },
  valor_subtotal: { type: String, required: true },
  valor_total: { type: String, required: true },
  isPaid: { type: Boolean, required: false, default: false },
  plugoneAffiliateStatus: { type: String, required: true },
})

export default mongoose.model<ILojaIntegradaAffiliateOrders>('LojaIntegradaOrders', LojaIntegradaAffiliateOrders, 'LojaIntegradaOrders')
