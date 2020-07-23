export enum Integrations {
  VTEX = "vtex",
  LOJA_INTEGRADA = "loja_integrada",
}

export interface IIntegration {
  id: string;
  active: boolean;
  type: Integrations;
  organization_id: string;
  integration_secrets_id: string;
  created_at: Date;
  updated_at: Date;
}

export interface ILojaIntegradaSecrets {
  appKey: string;
}
