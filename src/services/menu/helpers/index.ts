import { ServiceRoles } from '../../services/types'

/** Services */

import OrganizationRulesService from '../../organization-rules/service'
import { Integrations } from '../../integration/types'
import knexDatabase from '../../../knex-database'

export const organizationAdminMenu = async (integrationType: Integrations, organizationId: string) => {
  if (integrationType === Integrations.IUGU || integrationType === Integrations.KLIPFOLIO) {
    return [
      {
        group: 'menuitems',
        items: [
          {
            name: 'overview',
            slug: '/org/overview',
          },
          {
            name: 'settings',
            slug: '/org/settings',
          },
        ],
      },
      {
        group: 'services',
        items: [
          {
            name: 'affiliate',
            children: [
              {
                name: 'signatures',
                slug: '/org/affiliate/signatures',
              },
              {
                name: 'commission',
                slug: '/org/affiliate/commission',
              },
              {
                name: 'members',
                slug: '/org/affiliate/members',
              },
              {
                name: 'payments',
                slug: '/org/affiliate/payments',
              },
            ],
          },
        ],
      },
    ]
  }

  const paymentServiceStatus = await OrganizationRulesService.getAffiliateTeammateRules(organizationId, undefined, true)

  const baseAdminMenu: any = [
    {
      group: 'menuitems',
      items: [
        {
          name: 'overview',
          slug: '/org/overview',
        },
        {
          name: 'settings',
          slug: '/org/settings',
        },
      ],
    },
    {
      group: 'services',
      items: [
        {
          name: 'affiliate',
          children: [
            {
              name: 'orders',
              slug: '/org/affiliate/orders',
            },
            {
              name: 'commission',
              slug: '/org/affiliate/commission',
            },
            {
              name: 'members',
              slug: '/org/affiliate/members',
            },
            {
              name: 'payments',
              slug: '/org/affiliate/payments',
            },
            // {
            //   name: 'Plug Store',
            //   slug: '/org/affiliate/app-store',
            // },
          ],
        },
      ],
    },
  ]

  if (!paymentServiceStatus) return baseAdminMenu

  if (integrationType === Integrations.VTEX || integrationType === Integrations.LOJA_INTEGRADA) {
    if (paymentServiceStatus.affiliateStore) {
      baseAdminMenu[1].items[0].children.push({
        name: 'showCase',
        slug: '/org/affiliate/showcase',
      })
    }
  }

  if (integrationType === Integrations.VTEX) {
    if (paymentServiceStatus.maxSales > 0) {
      baseAdminMenu[1].items[0].children.push(
        {
          name: 'insideSales',
          slug: '/org/affiliate/inside-sales',
        },
        {
          name: 'abandonedCarts',
          slug: '/org/affiliate/abandoned-carts',
        }
      )
    }

    return baseAdminMenu
  }

  return baseAdminMenu
}

export const organizationMemberMenu = [
  {
    group: 'menuitems',
    items: [
      {
        name: 'overview',
        slug: '/org/overview',
      },
    ],
  },
]

export const affiliateMemberMountMenu = async (serviceRole: string, integrationType: Integrations, organizationId: string) => {
  if (integrationType === Integrations.IUGU || integrationType === Integrations.KLIPFOLIO) {
    return [
      {
        group: 'menuitems',
        items: [
          {
            name: 'overview',
            slug: '/org/overview',
          },
        ],
      },
      {
        group: 'services',
        items: [
          {
            name: 'affiliate',
            children: [
              {
                name: 'signatures',
                slug: '/org/affiliate/signatures',
              },
              {
                name: 'commission',
                slug: '/org/affiliate/commission',
              },
              {
                name: 'linkGenerator',
                slug: '/org/affiliate/link-generator',
              },
              {
                name: 'payments',
                slug: '/org/affiliate/payments',
              },
            ],
          },
        ],
      },
    ]
  }

  let affiliateAnalyst: any = {
    name: 'affiliate',
    children: [
      {
        name: 'orders',
        slug: '/org/affiliate/orders',
      },
      {
        name: 'commission',
        slug: '/org/affiliate/commission',
      },
      {
        name: 'payments',
        slug: '/org/affiliate/payments',
      },
      {
        name: 'linkGenerator',
        slug: '/org/affiliate/link-generator',
      },
    ],
  }

  let affiliateSale: any = {
    name: 'affiliate',
    children: [
      {
        name: 'orders',
        slug: '/org/affiliate/orders',
      },
      {
        name: 'commission',
        slug: '/org/affiliate/commission',
      },
      {
        name: 'payments',
        slug: '/org/affiliate/payments',
      },
      {
        name: 'linkGenerator',
        slug: '/org/affiliate/link-generator',
      },
    ],
  }

  const paymentServiceStatus = await OrganizationRulesService.getAffiliateTeammateRules(organizationId)

  const organization = await knexDatabase.knexConfig('organizations').where('id', organizationId).first().select('abandoned_cart')

  switch (serviceRole) {
    case ServiceRoles.ANALYST:
      if (paymentServiceStatus.affiliateStore) {
        affiliateAnalyst = {
          ...affiliateAnalyst,
          children: [
            ...affiliateAnalyst.children,
            {
              name: 'showCase',
              slug: '/org/affiliate/showcase',
            },
          ],
        }
      }

      if (integrationType === Integrations.VTEX && organization.abandoned_cart) {
        affiliateAnalyst = {
          ...affiliateAnalyst,
          children: [
            ...affiliateAnalyst.children,
            {
              name: 'abandonedCart',
              slug: '/org/affiliate/abandoned-carts',
            },
          ],
        }
      }

      return [...organizationMemberMenu, { group: 'services', items: [affiliateAnalyst] }]
    case ServiceRoles.SALE:
      if (paymentServiceStatus.affiliateStore) {
        affiliateSale = {
          ...affiliateSale,
          children: [
            ...affiliateSale.children,
            {
              name: 'showCase',
              slug: '/org/affiliate/showcase',
            },
          ],
        }
      }

      if (integrationType === Integrations.VTEX && organization.abandoned_cart) {
        affiliateSale = {
          ...affiliateSale,
          children: [
            ...affiliateSale.children,
            {
              name: 'abandonedCart',
              slug: '/org/affiliate/abandoned-carts',
            },
          ],
        }
      }
      return [...organizationMemberMenu, { group: 'services', items: [affiliateSale] }]
    default:
      return
  }
}
