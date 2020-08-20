import { ServiceRoles } from '../../services/types'

/** Services */

import OrganizationRulesService from '../../organization-rules/service'

export const organizationAdminMenu = async (vtexIntegration: boolean, organizationId: string) => {
  if (vtexIntegration) {
    const paymentServiceStatus = await OrganizationRulesService.getAffiliateTeammateRules(organizationId)

    const vtexBaseAdminMenu: any = [
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
              {
                name: 'showCase',
                slug: '/affiliate/showcase',
              },
            ],
          },
        ],
      },
    ]

    if (paymentServiceStatus.maxSales > 0) {
      vtexBaseAdminMenu[1].items[0].children.push({
        name: 'insideSales',
        slug: '/affiliate/inside-sales',
      })
    }

    return vtexBaseAdminMenu
  }

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

export const affiliateMemberMountMenu = (serviceRole: string, vtexIntegration: boolean) => {
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

  switch (serviceRole) {
    case ServiceRoles.ANALYST:
      if (vtexIntegration) {
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
      return [...organizationMemberMenu, { group: 'services', items: [affiliateAnalyst] }]
    case ServiceRoles.SALE:
      if (vtexIntegration) {
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
      return [...organizationMemberMenu, { group: 'services', items: [affiliateSale] }]
    default:
      return
  }
}
