package com.nested.app.config;

import com.nested.app.enums.BasketType;
import org.springframework.core.convert.converter.Converter;
import org.springframework.stereotype.Component;

/**
 * Converter for Spring MVC to convert String request parameters to BasketType enum. This handles
 * the conversion for @RequestParam annotations.
 */
@Component
public class StringToBasketTypeConverter implements Converter<String, BasketType> {

  @Override
  public BasketType convert(String source) {
    return BasketType.fromValue(source);
  }
}
