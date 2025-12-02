import React, { useEffect, useState } from 'react'
import ExplainTrasactionDetail  from './explain_transaction_detail';


const Getbyid=({row,bankAccountId,closeExplainTransactionModal,transactionDetailActions,getbankdetails})=>{
    const [responsedata,setresponsedata]=useState({})
    useEffect(()=>{
      const  response= transactionDetailActions
	.getTransactionDetail(row.id)
	.then((responsedata) => {
		
	if(responsedata.status===200)
		setresponsedata(responsedata)
		})
    },[row])
   
    return <>
		
			<>{
		responsedata.data?.length>0 && 
			responsedata.data?.map((i,inx)=>{
				 	return < ExplainTrasactionDetail
				closeExplainTransactionModal={(e) => {
						closeExplainTransactionModal(e);
					}
					}
					bankId={bankAccountId}
					creationMode={row.creationMode}
					selectedData={row}
					data={i}

					getbankdetails={getbankdetails}
				/>
			})}</>
		<>
	{(row.explanationIds.length > 0 && row.explinationStatusEnum === 'PARTIAL')   &&   
	< ExplainTrasactionDetail
			closeExplainTransactionModal={(e) => {
					closeExplainTransactionModal(e);
				}
				}
				bankId={bankAccountId}
				creationMode={row.creationMode}
				selectedData={row}

				getbankdetails={getbankdetails}

				data={{}}
			/>
	}
			</>
			</>	

}
export default Getbyid