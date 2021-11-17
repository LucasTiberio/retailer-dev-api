import { buildGetProductsVtexUrl } from '../vtex/helpers'
import Axios from 'axios'

export const getVtexProducts = async (accountName: string, from: number = 0, to: number = 49, search?: string, category?: string) => {
    let searchUrl = `${buildGetProductsVtexUrl(accountName)}`;

    if (search) {
        searchUrl += `/${search}`
    }
    
    if (category) {
        searchUrl += `?fq=C:/${category}/`
    }

    searchUrl += `${category ? '&' : '?'}_from=${from}&_to=${to}`;

    const { data: vtexProductsData } = await Axios.get(searchUrl, {
        headers: {
            'content-type': 'Content-Type',
        },
    })

    return vtexProductsData.map((product: any) => {
        return product;
    })
}

export default {
    getVtexProducts
}