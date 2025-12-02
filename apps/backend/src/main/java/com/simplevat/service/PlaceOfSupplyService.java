package com.simplevat.service;

import com.simplevat.entity.PlaceOfSupply;

import java.util.List;

/**
 * Created By Zain Khan On 21-12-2020
 */
public abstract class PlaceOfSupplyService extends SimpleVatService <Integer, PlaceOfSupply> {
    public abstract List<PlaceOfSupply> getPlaceOfSupplyForDropdown();

}
