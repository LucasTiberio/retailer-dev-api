import { ServiceRoles } from '../../services/types'

/** Services */

import OrganizationRulesService from '../../organization-rules/service'
import { Integrations } from '../../integration/types'

export const organizationAdminMenu = async (integrationType: Integrations, organizationId: string) => {
  if (integrationType === Integrations.IUGU) {
    return [
      {
        group: 'menu-items',
        items: [
          {
            name: 'overview',
            slug: '/overview',
          },
          {
            name: 'settings',
            slug: '/settings',
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
                slug: '/affiliate/signatures',
              },
              {
                name: 'commission',
                slug: '/affiliate/commission',
              },
              {
                name: 'members',
                slug: '/affiliate/members',
              },
              {
                name: 'payments',
                slug: '/affiliate/payments',
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
      group: 'menu-items',
      items: [
        {
          name: 'overview',
          slug: '/overview',
        },
        {
          name: 'settings',
          slug: '/settings',
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
              slug: '/affiliate/orders',
            },
            {
              name: 'commission',
              slug: '/affiliate/commission',
            },
            {
              name: 'members',
              slug: '/affiliate/members',
            },
            {
              name: 'payments',
              slug: '/affiliate/payments',
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
        slug: '/affiliate/showcase',
      })
    }
  }

  if (integrationType === Integrations.VTEX) {
    if (paymentServiceStatus.maxSales > 0) {
      baseAdminMenu[1].items[0].children.push(
        {
          name: 'insideSales',
          slug: '/affiliate/inside-sales',
        },
        {
          name: 'abandonedCarts',
          slug: '/affiliate/abandoned-carts',
        }
      )
    }

    return baseAdminMenu
  }

  return baseAdminMenu
}

export const organizationMemberMenu = [
  {
    group: 'menu-items',
    items: [
      {
        name: 'overview',
        slug: '/overview',
      },
    ],
  },
]

export const affiliateMemberMountMenu = async (serviceRole: string, integrationType: Integrations, organizationId: string) => {
  if (integrationType === Integrations.IUGU) {
    return [
      {
        group: 'menu-items',
        items: [
          {
            name: 'overview',
            slug: '/overview',
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
                slug: '/affiliate/signatures',
              },
              {
                name: 'commission',
                slug: '/affiliate/commission',
              },
              {
                name: 'linkGenerator',
                slug: '/affiliate/link-generator',
              },
              {
                name: 'payments',
                slug: '/affiliate/payments',
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
        slug: '/affiliate/orders',
      },
      {
        name: 'commission',
        slug: '/affiliate/commission',
      },
      {
        name: 'payments',
        slug: '/affiliate/payments',
      },
      {
        name: 'linkGenerator',
        slug: '/affiliate/link-generator',
      },
    ],
  }

  let affiliateSale: any = {
    name: 'affiliate',
    children: [
      {
        name: 'orders',
        slug: '/affiliate/orders',
      },
      {
        name: 'commission',
        slug: '/affiliate/commission',
      },
      {
        name: 'payments',
        slug: '/affiliate/payments',
      },
    ],
  }

  const paymentServiceStatus = await OrganizationRulesService.getAffiliateTeammateRules(organizationId)

  switch (serviceRole) {
    case ServiceRoles.ANALYST:
      if (paymentServiceStatus.affiliateStore) {
        affiliateAnalyst = {
          ...affiliateAnalyst,
          children: [
            ...affiliateAnalyst.children,
            {
              name: 'showCase',
              slug: '/affiliate/showcase',
            },
          ],
        }
      }

      if (integrationType === Integrations.VTEX) {
        affiliateAnalyst = {
          ...affiliateAnalyst,
          children: [
            ...affiliateAnalyst.children,
            {
              name: 'abandonedCart',
              slug: '/affiliate/abandoned-carts',
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
              slug: '/affiliate/showcase',
            },
          ],
        }
      }

      if (integrationType === Integrations.VTEX) {
        affiliateSale = {
          ...affiliateSale,
          children: [
            ...affiliateSale.children,
            {
              name: 'abandonedCart',
              slug: '/affiliate/abandoned-carts',
            },
          ],
        }
      }
      return [...organizationMemberMenu, { group: 'services', items: [affiliateSale] }]
    default:
      return
  }
}
