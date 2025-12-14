package com.simpleaccounts.model;

import java.util.List;
import lombok.Data;
import org.springframework.stereotype.Component;

@Data
@Component
public class RoleRequestModel {
private Integer roleID;
private String roleName;
private String roleDescription;
private List<Integer> moduleListIds;
private Boolean isActive;

}
