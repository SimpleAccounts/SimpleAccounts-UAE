package com.simpleaccounts.migration;

import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class ProductAndVersionListModel {
    private List<String> productName = new ArrayList<>();
   // private List<String> productVersion  = new ArrayList<>();

}
