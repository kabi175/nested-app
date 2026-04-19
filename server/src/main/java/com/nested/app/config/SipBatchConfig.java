package com.nested.app.config;

import com.nested.app.entity.SIPOrder;
import com.nested.app.entity.SIPOrder.ScheduleStatus;
import com.nested.app.repository.SIPOrderRepository;
import com.nested.app.services.SipCycleReconcilerProcessor;
import jakarta.persistence.EntityManagerFactory;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.batch.core.Job;
import org.springframework.batch.core.Step;
import org.springframework.batch.core.job.builder.JobBuilder;
import org.springframework.batch.core.repository.JobRepository;
import org.springframework.batch.core.step.builder.StepBuilder;
import org.springframework.batch.item.data.RepositoryItemReader;
import org.springframework.batch.item.data.builder.RepositoryItemReaderBuilder;
import org.springframework.batch.item.database.JpaItemWriter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.domain.Sort;
import org.springframework.transaction.PlatformTransactionManager;

@Configuration
@RequiredArgsConstructor
public class SipBatchConfig {

  private static final int CHUNK_SIZE = 100;

  private final JobRepository jobRepository;
  private final PlatformTransactionManager transactionManager;
  private final SIPOrderRepository sipOrderRepository;
  private final SipCycleReconcilerProcessor processor;

  @Bean
  public RepositoryItemReader<SIPOrder> sipRunningOrderReader() {
    return new RepositoryItemReaderBuilder<SIPOrder>()
        .name("sipRunningOrderReader")
        .repository(sipOrderRepository)
        .methodName("findByScheduleStatus")
        .arguments(List.of(ScheduleStatus.RUNNING))
        .pageSize(CHUNK_SIZE)
        .sorts(Map.of("id", Sort.Direction.ASC))
        .build();
  }

  @Bean
  public JpaItemWriter<SIPOrder> sipOrderItemWriter(EntityManagerFactory emf) {
    JpaItemWriter<SIPOrder> writer = new JpaItemWriter<>();
    writer.setEntityManagerFactory(emf);
    return writer;
  }

  @Bean
  public Step sipCycleReconcilerStep(
      RepositoryItemReader<SIPOrder> sipRunningOrderReader,
      JpaItemWriter<SIPOrder> sipOrderItemWriter) {
    return new StepBuilder("sipCycleReconcilerStep", jobRepository)
        .<SIPOrder, SIPOrder>chunk(CHUNK_SIZE, transactionManager)
        .reader(sipRunningOrderReader)
        .processor(processor)
        .writer(sipOrderItemWriter)
        .build();
  }

  @Bean("sipCycleReconcilerBatchJob")
  public Job sipCycleReconcilerBatchJob(Step sipCycleReconcilerStep) {
    return new JobBuilder("sipCycleReconcilerJob", jobRepository)
        .start(sipCycleReconcilerStep)
        .build();
  }
}
