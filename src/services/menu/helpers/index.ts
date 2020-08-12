import { ServiceRoles } from '../../services/types'

export const organizationAdminMenu = (vtexIntegration: boolean) => {
  // if (vtexIntegration) {
  //   return [
  //     {
  //       group: 'menu-items',
  //       items: [
  //         {
  //           name: 'overview',
  //           slug: '/overview',
  //         },
  //         {
  //           name: 'settings',
  //           slug: '/settings',
  //         },
  //       ],
  //     },
  //     {
  //       group: 'services',
  //       items: [
  //         {
  //           name: 'affiliate',
  //           children: [
  //             {
  //               name: 'orders',
  //               slug: '/affiliate/orders',
  //             },
  //             {
  //               name: 'commission',
  //               slug: '/affiliate/commission',
  //             },
  //             {
  //               name: 'members',
  //               slug: '/affiliate/members',
  //             },
  //             {
  //               name: 'payments',
  //               slug: '/affiliate/payments',
  //             },
  //             {
  //               name: 'showCase',
  //               slug: '/affiliate/showcase',
  //             },
  //           ],
  //         },
  //       ],
  //     },
  //   ]
  // }

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

  const affiliateSale: any = {
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
      // if (vtexIntegration) {
      //   affiliateAnalyst = {
      //     ...affiliateAnalyst,
      //     children: [
      //       ...affiliateAnalyst.children,
      //       {
      //         name: 'showCase',
      //         slug: '/affiliate/showcase',
      //       },
      //     ],
      //   }
      // }
      return [...organizationMemberMenu, { group: 'services', items: [affiliateAnalyst] }]
    case ServiceRoles.SALE:
      return [...organizationMemberMenu, { group: 'services', items: [affiliateSale] }]
    default:
      return
  }
}
