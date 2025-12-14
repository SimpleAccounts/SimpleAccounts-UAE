package com.simpleaccounts.service;

import com.simpleaccounts.entity.PlaceOfSupply;
import java.util.List;

/**
 * Created By Zain Khan On 21-12-2020
 */
public abstract class PlaceOfSupplyService extends SimpleAccountsService <Integer, PlaceOfSupply> {
    public abstract List<PlaceOfSupply> getPlaceOfSupplyForDropdown();

}
