import { ServiceRoles } from '../../services/types'

/** Services */

import OrganizationRulesService from '../../organization-rules/service'
import { Integrations } from '../../integration/types'
import knexDatabase from '../../../knex-database'

export const organizationAdminMenu = async (integrationType: Integrations, organizationId: string, slug: string) => {
  if (integrationType === Integrations.IUGU || integrationType === Integrations.KLIPFOLIO) {
    return [
      {
        group: 'menuitems',
        items: [
          {
            name: 'overview',
            slug: `/org/${slug}/overview`,
          },
          {
            name: 'settings',
            slug: `/org/${slug}/settings`,
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
                slug: `/org/${slug}/affiliate/signatures`,
              },
              {
                name: 'commission',
                slug: `/org/${slug}/affiliate/commission`,
              },
              {
                name: 'members',
                slug: `/org/${slug}/affiliate/members`,
              },
              {
                name: 'payments',
                slug: `/org/${slug}/affiliate/payments`,
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
          slug: `/org/${slug}/overview`,
        },
        {
          name: 'settings',
          slug: `/org/${slug}/settings`,
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
              slug: `/org/${slug}/affiliate/orders`,
            },
            {
              name: 'commission',
              slug: `/org/${slug}/affiliate/commission`,
            },
            {
              name: 'members',
              slug: `/org/${slug}/affiliate/members`,
            },
            {
              name: 'payments',
              slug: `/org/${slug}/affiliate/payments`,
            },
            {
              name: 'Plug Store',
              slug: `/org/${slug}/affiliate/app-store`,
            },
            {
              name: 'Meus Apps',
              slug: `/org/${slug}/affiliate/apps`,
            },
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
        slug: `/org/${slug}/affiliate/showcase`,
      })
    }
  }

  if (integrationType === Integrations.VTEX) {
    if (paymentServiceStatus.maxSales > 0) {
      baseAdminMenu[1].items[0].children.push(
        {
          name: 'insideSales',
          slug: `/org/${slug}/affiliate/inside-sales`,
        },
        {
          name: 'abandonedCarts',
          slug: `/org/${slug}/affiliate/abandoned-carts`,
        }
      )
    }

    return baseAdminMenu
  }

  return baseAdminMenu
}

export const organizationMemberMenu = (slug: string) => [
  {
    group: 'menuitems',
    items: [
      {
        name: 'overview',
        slug: `/org/${slug}/overview`,
      },
    ],
  },
]

export const affiliateMemberMountMenu = async (serviceRole: string, integrationType: Integrations, organizationId: string, slug: string) => {
  if (integrationType === Integrations.IUGU || integrationType === Integrations.KLIPFOLIO) {
    return [
      {
        group: 'menuitems',
        items: [
          {
            name: 'overview',
            slug: `/org/${slug}/overview`,
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
                slug: `/org/${slug}/affiliate/signatures`,
              },
              {
                name: 'commission',
                slug: `/org/${slug}/affiliate/commission`,
              },
              {
                name: 'linkGenerator',
                slug: `/org/${slug}/affiliate/link-generator`,
              },
              {
                name: 'payments',
                slug: `/org/${slug}/affiliate/payments`,
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
        slug: `/org/${slug}/affiliate/orders`,
      },
      {
        name: 'commission',
        slug: `/org/${slug}/affiliate/commission`,
      },
      {
        name: 'payments',
        slug: `/org/${slug}/affiliate/payments`,
      },
      {
        name: 'linkGenerator',
        slug: `/org/${slug}/affiliate/link-generator`,
      },
    ],
  }

  let affiliateSale: any = {
    name: 'affiliate',
    children: [
      {
        name: 'orders',
        slug: `/org/${slug}/affiliate/orders`,
      },
      {
        name: 'commission',
        slug: `/org/${slug}/affiliate/commission`,
      },
      {
        name: 'payments',
        slug: `/org/${slug}/affiliate/payments`,
      },
      {
        name: 'linkGenerator',
        slug: `/org/${slug}/affiliate/link-generator`,
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
              slug: `/org/${slug}/affiliate/showcase`,
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
              slug: `/org/${slug}/affiliate/abandoned-carts`,
            },
          ],
        }
      }

      return [...organizationMemberMenu(slug), { group: 'services', items: [affiliateAnalyst] }]
    case ServiceRoles.SALE:
      if (paymentServiceStatus.affiliateStore) {
        affiliateSale = {
          ...affiliateSale,
          children: [
            ...affiliateSale.children,
            {
              name: 'showCase',
              slug: `/org/${slug}/affiliate/showcase`,
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
              slug: `/org/${slug}/affiliate/abandoned-carts`,
            },
          ],
        }
      }
      return [...organizationMemberMenu(slug), { group: 'services', items: [affiliateSale] }]
    default:
      return
  }
}
