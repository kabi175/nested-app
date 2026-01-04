package com.nested.app.annotation;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Annotation to mark endpoints that require MFA verification. The MfaEnforcementFilter will check
 * for this annotation and validate the X-MFA-Token header.
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface RequiresMfa {
  /**
   * The action that requires MFA (e.g., "MF_BUY", "MF_SELL", "BANK_CHANGE")
   *
   * @return Action string
   */
  String action();
}
