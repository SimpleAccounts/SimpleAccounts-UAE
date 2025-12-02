let store
export const getAmountCurrency=(amount)=>{
    if(store){
        let state=store.getState();
       
    let currency=state?.common?.currency_list?.currency_list?.[0]?.currencyIsoCode
    if(currency){
    return `${currency} ${amount}`    
    }
    return `AED ${amount}`
    }
    return ""
}
export const getCurrency=()=>{
    if(store){
        let state=store.getState();
       
    let currency=state?.common?.currency_list?.currency_list?.[0]?.currencyIsoCode
    if(currency){
    return `${currency}`    
    }
    return `AED`
    }
    return ""
}
export const storecreator=(actualstore)=>{
    store=actualstore
}