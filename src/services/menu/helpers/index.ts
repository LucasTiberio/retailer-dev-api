import { ServiceRoles } from "../../services/types"

export const organizationAdminMenu = [
    {
        group: "menu-items",
        items: [
            {
                name: 'overview',
                slug: '/overview'
            },{
                name: 'settings',
                slug: '/settings'
            },
            {
                name: 'integrations',
                slug: '/integrations'
            },
        ]
    },
    {
        group: "services",
        items: [
            {
                name: 'affiliate',
                children: [
                    {
                        name: 'orders',
                        slug: '/affiliate/orders'
                    },
                    {
                        name: 'commission',
                        slug: '/affiliate/commission'
                    },
                    {
                        name: 'members',
                        slug: '/affiliate/members'
                    },
                    {
                        name: 'payments',
                        slug: '/affiliate/payments'
                    }
                ]
            }
        ]
    }
]

export const organizationMemberMenu = [
    {
        group: "menu-items",
        items: [
            {
                name: 'overview',
                slug: '/overview'
            }
        ]
    }
]

export const affiliateMemberMountMenu = (serviceRole: string) => {

    const affiliateAnalyst : any =  {
        name: 'affiliate',
        children: [
            {
                name: 'orders',
                slug: '/affiliate/orders'
            },
            {
                name: 'commission',
                slug: '/affiliate/commission'
            },
            {
                name: 'settings',
                slug: '/affiliate/settings'
            },
            {
                name: 'payments',
                slug: '/affiliate/payments'
            },
            {
                name: 'linkGenerator',
                slug: '/affiliate/link-generator'
            }
        ]
    }

    const affiliateSale : any =  {
        name: 'affiliate',
        children: [
            {
                name: 'orders',
                slug: '/affiliate/orders'
            },
            {
                name: 'commission',
                slug: '/affiliate/commission'
            },
            {
                name: 'payments',
                slug: '/affiliate/payments'
            },
        ]
    }

    switch (serviceRole) {
        case ServiceRoles.ANALYST:
            return [...organizationMemberMenu, {group: "services", items: [affiliateAnalyst]}]
        case ServiceRoles.SALE:
            return [...organizationMemberMenu, {group: "services", items: [affiliateSale]}]
        default: return;
    }



}