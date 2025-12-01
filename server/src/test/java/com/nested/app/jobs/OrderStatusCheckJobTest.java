package com.nested.app.jobs;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.nested.app.client.mf.BuyOrderApiClient;
import com.nested.app.client.mf.dto.OrderData;
import com.nested.app.entity.Fund;
import com.nested.app.entity.OrderItems;
import com.nested.app.repository.OrderItemsRepository;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.quartz.JobDataMap;
import org.quartz.JobDetail;
import org.quartz.JobExecutionContext;
import org.quartz.JobKey;
import org.quartz.Scheduler;
import reactor.core.publisher.Mono;

@ExtendWith(MockitoExtension.class)
class OrderStatusCheckJobTest {

  @Mock private BuyOrderApiClient buyOrderAPIClient;
  @Mock private OrderItemsRepository orderItemsRepository;
  @Mock private Scheduler scheduler;
  @Mock private JobExecutionContext jobExecutionContext;
  @Mock private JobDetail jobDetail;

  @InjectMocks private BuyOrderFulfillmentJob orderStatusCheckJob;

  private JobDataMap jobDataMap;
  private String orderId;

  @BeforeEach
  void setUp() {
    orderId = "test-order-123";
    jobDataMap = new JobDataMap();
    jobDataMap.put("orderId", orderId);
  }

  @Test
  void testDistributeUnitsEqually_ThreeItems() {
    // Given
    List<OrderItems> orderItems = createOrderItems(3, 0.0); // zero amounts
    BigDecimal totalUnits = BigDecimal.valueOf(100.0);

    // When
    orderStatusCheckJob.distributeUnitsEqually(orderItems, totalUnits);

    // Then
    double sum =
        orderItems.stream()
            .mapToDouble(item -> item.getUnits() != null ? item.getUnits() : 0.0)
            .sum();
    assertEquals(100.0, sum, 0.0001, "Total units should equal 100");

    // Verify all items got units
    assertNotNull(orderItems.get(0).getUnits());
    assertNotNull(orderItems.get(1).getUnits());
    assertNotNull(orderItems.get(2).getUnits());
    assertTrue(orderItems.get(0).getUnits() > 0);
    assertTrue(orderItems.get(1).getUnits() > 0);
    assertTrue(orderItems.get(2).getUnits() > 0);

    // Items should be roughly equal (within rounding tolerance)
    double avg = 100.0 / 3.0;
    assertEquals(avg, orderItems.get(0).getUnits(), 0.01);
    assertEquals(avg, orderItems.get(1).getUnits(), 0.01);
    assertEquals(avg, orderItems.get(2).getUnits(), 0.01);
  }

  @Test
  void testDistributeUnitsEqually_TwoItems() {
    // Given
    List<OrderItems> orderItems = createOrderItems(2, 0.0);
    BigDecimal totalUnits = BigDecimal.valueOf(50.0);

    // When
    orderStatusCheckJob.distributeUnitsEqually(orderItems, totalUnits);

    // Then
    assertEquals(25.0, orderItems.get(0).getUnits(), 0.0001);
    assertEquals(25.0, orderItems.get(1).getUnits(), 0.0001);

    double sum = orderItems.stream().mapToDouble(OrderItems::getUnits).sum();
    assertEquals(50.0, sum, 0.0001);
  }

  @Test
  void testDistributeUnitsEqually_SingleItem() {
    // Given
    List<OrderItems> orderItems = createOrderItems(1, 0.0);
    BigDecimal totalUnits = BigDecimal.valueOf(100.0);

    // When
    orderStatusCheckJob.distributeUnitsEqually(orderItems, totalUnits);

    // Then
    assertEquals(100.0, orderItems.get(0).getUnits(), 0.0001);
  }

  @Test
  void testDistributeUnitsProportionally_EqualAmounts() {
    // Given
    List<OrderItems> orderItems = createOrderItemsWithAmounts(List.of(1000.0, 1000.0, 1000.0));
    BigDecimal totalUnits = BigDecimal.valueOf(300.0);
    double totalAmount = 3000.0;

    // When
    orderStatusCheckJob.distributeUnitsProportionally(orderItems, totalUnits, totalAmount);

    // Then
    assertEquals(100.0, orderItems.get(0).getUnits(), 0.0001);
    assertEquals(100.0, orderItems.get(1).getUnits(), 0.0001);
    assertEquals(100.0, orderItems.get(2).getUnits(), 0.0001);

    double sum = orderItems.stream().mapToDouble(OrderItems::getUnits).sum();
    assertEquals(300.0, sum, 0.0001);
  }

  @Test
  void testDistributeUnitsProportionally_DifferentAmounts() {
    // Given
    List<OrderItems> orderItems =
        createOrderItemsWithAmounts(
            List.of(5000.0, 3000.0, 2000.0) // 50%, 30%, 20%
            );
    BigDecimal totalUnits = BigDecimal.valueOf(100.0);
    double totalAmount = 10000.0;

    // When
    orderStatusCheckJob.distributeUnitsProportionally(orderItems, totalUnits, totalAmount);

    // Then
    assertEquals(50.0, orderItems.get(0).getUnits(), 0.0001);
    assertEquals(30.0, orderItems.get(1).getUnits(), 0.0001);
    assertEquals(20.0, orderItems.get(2).getUnits(), 0.0001);

    double sum = orderItems.stream().mapToDouble(OrderItems::getUnits).sum();
    assertEquals(100.0, sum, 0.0001);
  }

  @Test
  void testDistributeUnitsProportionally_WithRounding() {
    // Given
    List<OrderItems> orderItems =
        createOrderItemsWithAmounts(
            List.of(333.33, 333.33, 333.34) // amounts that don't divide evenly
            );
    BigDecimal totalUnits = BigDecimal.valueOf(99.999);
    double totalAmount = 1000.0;

    // When
    orderStatusCheckJob.distributeUnitsProportionally(orderItems, totalUnits, totalAmount);

    // Then
    // Verify total units are preserved despite rounding
    double sum = orderItems.stream().mapToDouble(OrderItems::getUnits).sum();
    assertEquals(99.999, sum, 0.001, "Total units should be preserved");

    // Verify all items got some units
    orderItems.forEach(item -> assertTrue(item.getUnits() > 0, "All items should have units"));
  }

  @Test
  void testDistributeUnitsProportionally_VerySmallUnits() {
    // Given
    List<OrderItems> orderItems = createOrderItemsWithAmounts(List.of(1000.0, 2000.0, 3000.0));
    BigDecimal totalUnits = BigDecimal.valueOf(0.0001);
    double totalAmount = 6000.0;

    // When
    orderStatusCheckJob.distributeUnitsProportionally(orderItems, totalUnits, totalAmount);

    // Then
    double sum = orderItems.stream().mapToDouble(OrderItems::getUnits).sum();
    assertEquals(0.0001, sum, 0.00001, "Total units should be preserved");
  }

  @Test
  void testExecute_SuccessfulOrder_WithValidData() throws Exception {
    // Given
    String orderId = "order-123";
    jobDataMap.put("orderId", orderId);

    OrderData orderData = new OrderData();
    orderData.setState(OrderData.OrderState.SUCCESSFUL);
    orderData.setAllottedUnits(100.0);
    orderData.setPurchasedPrice(50.0);

    List<OrderItems> orderItems = createOrderItemsWithAmounts(List.of(1000.0, 2000.0));

    when(jobExecutionContext.getMergedJobDataMap()).thenReturn(jobDataMap);
    when(jobExecutionContext.getJobDetail()).thenReturn(jobDetail);
    when(jobDetail.getKey()).thenReturn(new JobKey("testJob"));
    when(buyOrderAPIClient.fetchOrderDetails(orderId)).thenReturn(Mono.just(orderData));
    when(orderItemsRepository.findByRef(orderId)).thenReturn(orderItems);

    // When
    orderStatusCheckJob.execute(jobExecutionContext);

    // Then
    verify(orderItemsRepository).saveAll(orderItems);
    verify(scheduler).deleteJob(any(JobKey.class));

    // Verify units were distributed
    double sum = orderItems.stream().mapToDouble(OrderItems::getUnits).sum();
    assertEquals(100.0, sum, 0.0001);

    // Verify price was set
    orderItems.forEach(item -> assertEquals(50.0, item.getUnitPrice()));
  }

  @Test
  void testExecute_SuccessfulOrder_NoOrderItems() throws Exception {
    // Given
    OrderData orderData = new OrderData();
    orderData.setState(OrderData.OrderState.SUCCESSFUL);
    orderData.setAllottedUnits(100.0);
    orderData.setPurchasedPrice(50.0);

    when(jobExecutionContext.getMergedJobDataMap()).thenReturn(jobDataMap);
    when(jobExecutionContext.getJobDetail()).thenReturn(jobDetail);
    when(jobDetail.getKey()).thenReturn(new JobKey("testJob"));
    when(buyOrderAPIClient.fetchOrderDetails(orderId)).thenReturn(Mono.just(orderData));
    when(orderItemsRepository.findByRef(orderId)).thenReturn(List.of());

    // When
    orderStatusCheckJob.execute(jobExecutionContext);

    // Then
    verify(orderItemsRepository, never()).saveAll(any());
    verify(scheduler).deleteJob(any(JobKey.class));
  }

  @Test
  void testExecute_SuccessfulOrder_NullAllottedUnits() throws Exception {
    // Given
    OrderData orderData = new OrderData();
    orderData.setState(OrderData.OrderState.SUCCESSFUL);
    orderData.setAllottedUnits(null);
    orderData.setPurchasedPrice(50.0);

    List<OrderItems> orderItems = createOrderItems(2, 1000.0);

    when(jobExecutionContext.getMergedJobDataMap()).thenReturn(jobDataMap);
    when(jobExecutionContext.getJobDetail()).thenReturn(jobDetail);
    when(jobDetail.getKey()).thenReturn(new JobKey("testJob"));
    when(buyOrderAPIClient.fetchOrderDetails(orderId)).thenReturn(Mono.just(orderData));
    when(orderItemsRepository.findByRef(orderId)).thenReturn(orderItems);

    // When
    orderStatusCheckJob.execute(jobExecutionContext);

    // Then
    verify(orderItemsRepository).saveAll(orderItems);

    // Verify units were not set (should be null)
    orderItems.forEach(item -> assertNull(item.getUnits()));

    // Verify price was still set
    orderItems.forEach(item -> assertEquals(50.0, item.getUnitPrice()));
  }

  @Test
  void testExecute_SuccessfulOrder_NullPurchasedPrice() throws Exception {
    // Given
    OrderData orderData = new OrderData();
    orderData.setState(OrderData.OrderState.SUCCESSFUL);
    orderData.setAllottedUnits(100.0);
    orderData.setPurchasedPrice(null);

    List<OrderItems> orderItems = createOrderItemsWithAmounts(List.of(1000.0, 2000.0));

    when(jobExecutionContext.getMergedJobDataMap()).thenReturn(jobDataMap);
    when(jobExecutionContext.getJobDetail()).thenReturn(jobDetail);
    when(jobDetail.getKey()).thenReturn(new JobKey("testJob"));
    when(buyOrderAPIClient.fetchOrderDetails(orderId)).thenReturn(Mono.just(orderData));
    when(orderItemsRepository.findByRef(orderId)).thenReturn(orderItems);

    // When
    orderStatusCheckJob.execute(jobExecutionContext);

    // Then
    verify(orderItemsRepository).saveAll(orderItems);

    // Verify units were distributed
    double sum = orderItems.stream().mapToDouble(OrderItems::getUnits).sum();
    assertEquals(100.0, sum, 0.0001);

    // Verify price was not set (should be null)
    orderItems.forEach(item -> assertNull(item.getUnitPrice()));
  }

  @Test
  void testExecute_FailedOrder_JobDeleted() throws Exception {
    // Given
    OrderData orderData = new OrderData();
    orderData.setState(OrderData.OrderState.FAILED);

    when(jobExecutionContext.getMergedJobDataMap()).thenReturn(jobDataMap);
    when(jobExecutionContext.getJobDetail()).thenReturn(jobDetail);
    when(jobDetail.getKey()).thenReturn(new JobKey("testJob"));
    when(buyOrderAPIClient.fetchOrderDetails(orderId)).thenReturn(Mono.just(orderData));

    // When
    orderStatusCheckJob.execute(jobExecutionContext);

    // Then
    verify(orderItemsRepository, never()).findByRef(any());
    verify(orderItemsRepository, never()).saveAll(any());
    verify(scheduler).deleteJob(any(JobKey.class));
  }

  @Test
  void testExecute_PendingOrder_JobNotDeleted() throws Exception {
    // Given
    OrderData orderData = new OrderData();
    orderData.setState(OrderData.OrderState.PENDING);

    when(jobExecutionContext.getMergedJobDataMap()).thenReturn(jobDataMap);
    when(buyOrderAPIClient.fetchOrderDetails(orderId)).thenReturn(Mono.just(orderData));

    // When
    orderStatusCheckJob.execute(jobExecutionContext);

    // Then
    verify(orderItemsRepository, never()).findByRef(any());
    verify(scheduler, never()).deleteJob(any(JobKey.class));
  }

  @Test
  void testExecute_OrderNotFound() throws Exception {
    // Given
    when(jobExecutionContext.getMergedJobDataMap()).thenReturn(jobDataMap);
    when(buyOrderAPIClient.fetchOrderDetails(orderId)).thenReturn(Mono.empty());

    // When
    orderStatusCheckJob.execute(jobExecutionContext);

    // Then
    verify(orderItemsRepository, never()).findByRef(any());
    verify(scheduler, never()).deleteJob(any(JobKey.class));
  }

  @Test
  void testDistributeUnitsProportionally_TwoItems_60_40_Split() {
    // Given
    List<OrderItems> orderItems =
        createOrderItemsWithAmounts(
            List.of(6000.0, 4000.0) // 60% and 40%
            );
    BigDecimal totalUnits = BigDecimal.valueOf(1000.0);
    double totalAmount = 10000.0;

    // When
    orderStatusCheckJob.distributeUnitsProportionally(orderItems, totalUnits, totalAmount);

    // Then
    assertEquals(600.0, orderItems.get(0).getUnits(), 0.0001);
    assertEquals(400.0, orderItems.get(1).getUnits(), 0.0001);

    double sum = orderItems.stream().mapToDouble(OrderItems::getUnits).sum();
    assertEquals(1000.0, sum, 0.0001);
  }

  @Test
  void testDistributeUnitsProportionally_FourItems_ComplexRatio() {
    // Given
    List<OrderItems> orderItems =
        createOrderItemsWithAmounts(
            List.of(2500.0, 1500.0, 500.0, 500.0) // 50%, 30%, 10%, 10%
            );
    BigDecimal totalUnits = BigDecimal.valueOf(500.0);
    double totalAmount = 5000.0;

    // When
    orderStatusCheckJob.distributeUnitsProportionally(orderItems, totalUnits, totalAmount);

    // Then
    assertEquals(250.0, orderItems.get(0).getUnits(), 0.01);
    assertEquals(150.0, orderItems.get(1).getUnits(), 0.01);
    assertEquals(50.0, orderItems.get(2).getUnits(), 0.01);

    // Verify total is preserved
    double sum = orderItems.stream().mapToDouble(OrderItems::getUnits).sum();
    assertEquals(500.0, sum, 0.0001);
  }

  // Helper methods
  private List<OrderItems> createOrderItems(int count, double amount) {
    List<OrderItems> items = new ArrayList<>();
    for (int i = 0; i < count; i++) {
      OrderItems item = new OrderItems();
      item.setAmount(amount);
      items.add(item);
    }
    return items;
  }

  private List<OrderItems> createOrderItemsWithAmounts(List<Double> amounts) {
    List<OrderItems> items = new ArrayList<>();
    for (Double amount : amounts) {
      OrderItems item = new OrderItems();
      item.setAmount(amount);
      item.setFund(new Fund());
      items.add(item);
    }
    return items;
  }
}
