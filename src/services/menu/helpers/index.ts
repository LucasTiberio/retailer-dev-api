import { ServiceRoles } from "../../services/types"

export const organizationAdminMenu = [
    {
        name: 'overview',
        slug: '/overview'
    },{
        name: 'members',
        slug: '/members'
    },
    {
        name: 'integrations',
        slug: '/integrations'
    },
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
            }
        ]
    }
]

export const organizationMemberMenu = [
    {
        name: 'overview',
        slug: '/overview'
    },{
        name: 'members',
        slug: '/members'
    }
]

export const affiliateMemberMountMenu = (serviceRole: string) => {

    const affiliateAdmin : any =  {
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

    const affiliateResponsible : any =  {
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
                name: 'linkGenerator',
                slug: '/affiliate/link-generator'
            },
        ]
    }

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
                name: 'linkGenerator',
                slug: '/affiliate/link-generator'
            },
            {
                name: 'payments',
                slug: '/affiliate/payments'
            },
        ]
    }

    switch (serviceRole) {
        case ServiceRoles.ADMIN:
            return organizationMemberMenu.slice().push(affiliateAdmin)
        case ServiceRoles.RESPONSIBLE:
            return organizationMemberMenu.slice().push(affiliateResponsible)
        case ServiceRoles.ANALYST:
            return organizationMemberMenu.slice().push(affiliateAnalyst)
        default: return;
    }



}