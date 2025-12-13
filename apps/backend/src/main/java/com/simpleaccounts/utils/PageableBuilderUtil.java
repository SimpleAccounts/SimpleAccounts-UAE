package com.simpleaccounts.utils;

import java.util.ArrayList;
import java.util.List;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.domain.Sort.Direction;
import org.springframework.data.domain.Sort.Order;
import org.springframework.util.StringUtils;

@SuppressWarnings("deprecation")
public class PageableBuilderUtil {

	private static final int DEFAULT_MAX_PAGE_SIZE = 100;
	private static final int DEFAULT_MIN_PAGE_SIZE = 10;
	static final Pageable DEFAULT_PAGE_REQUEST = new PageRequest(0, 20);
	private static final String DEFAULT_SORT_DELIMITER = ";";
	private static final String DEFAULT_PROPERTY_DELIMITER = ",";
	
	public static Pageable getPageable(int pageSize,int page) {
		// Limit lower bound
		pageSize = pageSize < 1 ? DEFAULT_MIN_PAGE_SIZE : pageSize;
		// Limit upper bound
		pageSize = pageSize > DEFAULT_MAX_PAGE_SIZE ? DEFAULT_MAX_PAGE_SIZE : pageSize;
		// Default if necessary and default configured
		return new PageRequest(page, pageSize);

	}

	public static Pageable getPageableNoUpperBoundRestrictionOnPageSize(VatPageRequest request) {
		int page = request.getPage() > 0 ? request.getPage() : 0;
		int pageSize = request.getSize() > 0 ? request.getSize() : 10;
		// Limit lower bound
		pageSize = pageSize < 1 ? DEFAULT_MIN_PAGE_SIZE : pageSize;
		Sort sort = null;
		if (request.getSortStr() != null) {
			sort = getSortArgument(request.getSortStr());
		}
		// Default if necessary and default configured
		sort = sort == null  ? null : sort;
		return new PageRequest(page, pageSize, sort);

	}
	
	private static Sort getSortArgument(String sortStr) {
		String[] directionParameter = sortStr.split(DEFAULT_SORT_DELIMITER);
		Sort sort = parseParameterIntoSort(directionParameter, DEFAULT_PROPERTY_DELIMITER);

		return sort;
	}
	
	private static Sort parseParameterIntoSort(String[] source, String delimiter) {
		List<Order> allOrders = new ArrayList<Sort.Order>();
		for (String part : source) {
			if (part == null) {
				continue;
			}
			String[] elements = part.split(delimiter);
			Direction direction = elements.length == 0 ? null : Direction.fromString(elements[elements.length - 1]);
			for(int len = 0; len < elements.length; len++) {
				if (len == elements.length - 1 && direction != null) {
					continue;
				}
				String property = elements[len];
				if (!StringUtils.hasText(property)) {
					continue;
				}
				allOrders.add(new Order(direction, property));
			}
		}
		return allOrders.isEmpty() ? null : new Sort(allOrders);
	}
}
