package com.simplevat.rest.simpleaccountreports;

import lombok.Data;

import java.util.List;

@Data
public class SalesByProductResponseModel {

    List<SalesByProductModel> salesByProductModelList;

}
