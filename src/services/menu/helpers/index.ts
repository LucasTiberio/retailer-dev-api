import { ServiceRoles } from "../../services/types"

export const organizationAdminMenu = [
    {
        name: 'overview',
    },{
        name: 'members',
        children: [
            {
                name: 'members'
            },
        ]
    },
    {
        name: 'integrations',
    },
    {
        name: 'affiliate',
        children: [
            {
                name: 'orders',
            },
            {
                name: 'commission',
            }
        ]
    }
]

export const organizationMemberMenu = [
    {
        name: 'overview',
    },{
        name: 'members',
        children: [
            {
                name: 'members'
            },
        ]
    }
]

export const affiliateMemberMountMenu = (serviceRole: string) => {

    const affiliateAdmin =  {
        name: 'affiliate',
        children: [
            {
                name: 'orders',
            },
            {
                name: 'commission',
            },
        ]
    }

    const affiliateResponsible =  {
        name: 'affiliate',
        children: [
            {
                name: 'orders',
            },
            {
                name: 'commission',
            },
            {
                name: 'linkGenerator',
            },
        ]
    }

    const affiliateAnalyst =  {
        name: 'affiliate',
        children: [
            {
                name: 'orders',
            },
            {
                name: 'commission',
            },
            {
                name: 'linkGenerator',
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