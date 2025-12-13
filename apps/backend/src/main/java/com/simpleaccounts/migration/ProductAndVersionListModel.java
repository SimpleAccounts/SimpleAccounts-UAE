package com.simpleaccounts.migration;

import java.util.ArrayList;
import java.util.List;
import lombok.Data;

@Data
public class ProductAndVersionListModel {
    private List<String> productName = new ArrayList<>();

}
