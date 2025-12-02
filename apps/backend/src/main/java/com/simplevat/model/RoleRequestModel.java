package com.simplevat.model;


import lombok.Data;
import org.springframework.stereotype.Component;

import java.util.List;

@Data
@Component
public class RoleRequestModel {
private Integer roleID;
private String roleName;
private String roleDescription;
private List<Integer> moduleListIds;
private Boolean isActive;

}
