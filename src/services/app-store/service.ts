import AffiliateStoreApps from './models/AffiliateStoreApps'
import OrganizationAffiliateStoreApps from './models/OrganizationAffiliateStoreApps'
import OrganizationRulesService from '../organization-rules/service'
import { OrganizationAffiliateStoreAppConfig, OrganizationAffiliateStoreAppRequirement } from './types'

const installAffiliateStoreApp = async (input: { id: string; configs: OrganizationAffiliateStoreAppConfig[]; requirements: OrganizationAffiliateStoreAppRequirement[] }, organizationId: string) => {
  const planType = await OrganizationRulesService.getPlanType(organizationId)
  const installedApp = await OrganizationAffiliateStoreApps.findOne({ affiliateStoreApp: input.id, organizationId })

  const appToInstall = await AffiliateStoreApps.findById(input.id)
  if (!appToInstall) {
    throw new Error('app_not_found')
  }
  if (appToInstall.plans.length && !appToInstall.plans.includes(planType)) {
    throw new Error('this_app_cannot_be_installed_for_this_plan')
  }

  if (appToInstall.configs.length !== input.configs.length) {
    throw new Error('invalid_app_config')
  }

  const appToInstallConfigKeys = appToInstall.configs.map((item) => item.name)

  appToInstallConfigKeys.forEach((key) => {
    const inputConfigItem = input.configs.find((inputItem) => inputItem.key === key && inputItem.value.trim() !== '')
    if (!inputConfigItem) {
      throw new Error('invalid_app_config')
    }
  })

  if (installedApp) {
    await installedApp.update({
      active: true
    })

    return true
  }

  const createdInstallation = await OrganizationAffiliateStoreApps.create({
    affiliateStoreApp: appToInstall._id,
    organizationId,
    configs: input.configs,
    requirements: input.requirements,
    active: true
  })

  if (createdInstallation) return true

  throw new Error('could_not_install_app')
}

const uninstallAffiliateStoreApp = async (input: { id: string }, organizationId: string) => {
  const installedApp = await OrganizationAffiliateStoreApps.findOne({ affiliateStoreApp: input.id, organizationId })
  if (!installedApp) {
    throw new Error('app_not_installed')
  }
  await installedApp.update({
    active: false
  })

  return true
}

const editOrganizationAffiliateStoreAppConfig = async (
  input: { id: string; configs: OrganizationAffiliateStoreAppConfig[]; requirements: OrganizationAffiliateStoreAppRequirement[] },
  organizationId: string
) => {
  const planType = await OrganizationRulesService.getPlanType(organizationId)
  const installedApp = await OrganizationAffiliateStoreApps.findOne({ _id: input.id, organizationId })
  if (!installedApp) {
    throw new Error('app_not_installed')
  }

  const appToInstall = await AffiliateStoreApps.findById(installedApp.affiliateStoreApp)
  if (!appToInstall) {
    throw new Error('app_not_found')
  }
  if (appToInstall.plans.length && !appToInstall.plans.includes(planType)) {
    await installedApp.remove()
    throw new Error('this_app_cannot_be_installed_for_this_plan')
  }

  if (appToInstall.configs.length !== input.configs.length) {
    throw new Error('invalid_app_config')
  }

  const appToInstallConfigKeys = appToInstall.configs.map((item) => item.name)

  appToInstallConfigKeys.forEach((key) => {
    const inputConfigItem = input.configs.find((inputItem) => inputItem.key === key && inputItem.value.trim() !== '')
    if (!inputConfigItem) {
      throw new Error('invalid_app_config')
    }
  })

  installedApp.configs = input.configs
  installedApp.requirements = input.requirements

  await installedApp.save()

  return true
}

const getAffiliateStoreApps = async (organizationId: string) => {
  const planType = await OrganizationRulesService.getPlanType(organizationId)
  const installedApps = await OrganizationAffiliateStoreApps.find({ organizationId })
  const appList = await AffiliateStoreApps.find({}).lean()
  const storeApps = appList
    .filter((app) => !app.plans.length || (app.plans.length && app.plans.includes(planType)))
    .map((app) => ({
      ...app,
      id: app._id,
      isInstalled: installedApps.find((installedApp) => installedApp.id === app._id.toString())?.active ?? false,
    }))
  return storeApps
}

const getInstalledAffiliateStoreApps = async (organizationId: string) => {
  const planType = await OrganizationRulesService.getPlanType(organizationId)
  const installedApps = await OrganizationAffiliateStoreApps.find({ organizationId })
  const installedAppsStoreIds = installedApps.map((app) => app.affiliateStoreApp.toString())
  const installedAppsInStore = await AffiliateStoreApps.find({
    _id: {
      $in: installedAppsStoreIds,
    },
  }).lean()

  for (const installedApp of installedApps) {
    const storeApp = installedAppsInStore.find((app) => app._id.toString() === installedApp.affiliateStoreApp.toString())
    if (!storeApp) {
      throw new Error('app_not_found')
    }
    if (storeApp.plans.length && !storeApp.plans.includes(planType)) {
      await installedApp.remove()
    }
  }

  const updatedInstalledApps = await OrganizationAffiliateStoreApps.find({ organizationId })

  return updatedInstalledApps.map((installedApp) => {
    const storeApp = installedAppsInStore.find((app) => app._id.toString() === installedApp.affiliateStoreApp.toString())
    if (!storeApp) {
      throw new Error('app_not_found')
    }
    return {
      id: installedApp._id,
      affiliateStoreApp: installedApp.affiliateStoreApp,
      configs: installedApp.configs,
      requirements: installedApp.requirements,
    }
  })
}

const getInstalledAffiliateStoreApp = async (input: { id: string }, organizationId: string) => {
  const planType = await OrganizationRulesService.getPlanType(organizationId)
  const installedApp = await OrganizationAffiliateStoreApps.findOne({ _id: input.id, organizationId })

  if (!installedApp) {
    throw new Error('app_not_found')
  }

  const installedAppInStore = await AffiliateStoreApps.findById(installedApp.affiliateStoreApp)

  if (!installedAppInStore) {
    throw new Error('app_not_found')
  }

  if (installedAppInStore.plans.length && !installedAppInStore.plans.includes(planType)) {
    await installedApp.remove()
  }

  const updatedInstalledApp = await OrganizationAffiliateStoreApps.findOne({ _id: input.id, organizationId })
  if (!updatedInstalledApp) {
    throw new Error('app_not_found')
  }

  return {
    id: updatedInstalledApp._id,
    affiliateStoreApp: updatedInstalledApp.affiliateStoreApp,
    configs: updatedInstalledApp.configs,
    requirements: updatedInstalledApp.requirements,
  }
}

const getAffiliateStoreApp = async (input: { id: string }, organizationId: string) => {
  const planType = await OrganizationRulesService.getPlanType(organizationId)
  const installedApp = await OrganizationAffiliateStoreApps.findOne({ affiliateStoreApp: input.id, organizationId })
  const app = await AffiliateStoreApps.findOne({ _id: input.id }).lean()
  if (!app) {
    throw new Error('app_not_found')
  }
  if (app.plans.length && !app.plans.includes(planType)) {
    throw new Error('app_not_found')
  }
  return { ...app, id: app._id, isInstalled: !!installedApp }
}

export default {
  installAffiliateStoreApp,
  uninstallAffiliateStoreApp,
  editOrganizationAffiliateStoreAppConfig,
  getAffiliateStoreApps,
  getInstalledAffiliateStoreApps,
  getInstalledAffiliateStoreApp,
  getAffiliateStoreApp,
}
