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
            },
            {
                name: 'payments',
                slug: '/affiliate/payments'
            },
        ]
    }
]

export const organizationMemberMenu = [
    {
        name: 'overview',
        slug: '/overview'
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
        case ServiceRoles.ADMIN:
            return [...organizationMemberMenu, affiliateAdmin]
        case ServiceRoles.RESPONSIBLE:
            return [...organizationMemberMenu, affiliateResponsible]
        case ServiceRoles.ANALYST:
            return [...organizationMemberMenu, affiliateAnalyst]
        case ServiceRoles.SALE:
            return [...organizationMemberMenu, affiliateSale]
        default: return;
    }



}