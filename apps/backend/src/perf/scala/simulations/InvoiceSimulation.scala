package simulations

import io.gatling.core.Predef._
import io.gatling.http.Predef._
import scala.concurrent.duration._

/**
 * Gatling performance simulation for Invoice operations.
 * Tests create, read, list, and update invoice flows under load.
 *
 * Run with: mvn gatling:test -Dgatling.simulationClass=simulations.InvoiceSimulation
 */
class InvoiceSimulation extends Simulation {

  // Configuration
  val baseUrl = System.getProperty("baseUrl", "http://localhost:8080")
  val users = Integer.getInteger("users", 10).toInt
  val duration = Integer.getInteger("duration", 60).toInt

  // HTTP Protocol configuration
  val httpProtocol = http
    .baseUrl(baseUrl)
    .acceptHeader("application/json")
    .contentTypeHeader("application/json")
    .userAgentHeader("Gatling Performance Test")

  // Feeder for test data
  val invoiceFeeder = Iterator.continually(Map(
    "customerName" -> s"Customer ${scala.util.Random.nextInt(1000)}",
    "amount" -> (100 + scala.util.Random.nextInt(10000)),
    "timestamp" -> System.currentTimeMillis()
  ))

  // Authentication scenario
  val authenticate = exec(
    http("Authenticate")
      .post("/api/authenticate")
      .body(StringBody("""{"username":"admin","password":"admin123"}"""))
      .check(status.is(200))
      .check(jsonPath("$.token").saveAs("authToken"))
  ).exitHereIfFailed

  // Invoice List scenario
  val listInvoices = exec(
    http("List Invoices")
      .get("/api/invoices")
      .header("Authorization", "Bearer ${authToken}")
      .check(status.is(200))
      .check(responseTimeInMillis.lt(2000))
  )

  // Create Invoice scenario
  val createInvoice = feed(invoiceFeeder).exec(
    http("Create Invoice")
      .post("/api/invoices")
      .header("Authorization", "Bearer ${authToken}")
      .body(StringBody(session => s"""{
        "referenceNumber": "INV-${session("timestamp").as[Long]}",
        "customerName": "${session("customerName").as[String]}",
        "totalAmount": ${session("amount").as[Int]},
        "invoiceDate": "2024-12-01",
        "dueDate": "2024-12-31"
      }"""))
      .check(status.in(200, 201))
      .check(jsonPath("$.id").saveAs("invoiceId"))
  )

  // Get Invoice Detail scenario
  val getInvoiceDetail = exec(
    http("Get Invoice Detail")
      .get("/api/invoices/${invoiceId}")
      .header("Authorization", "Bearer ${authToken}")
      .check(status.is(200))
  )

  // Dashboard KPIs scenario
  val getDashboardKpis = exec(
    http("Dashboard KPIs")
      .get("/api/dashboard/kpis")
      .header("Authorization", "Bearer ${authToken}")
      .check(status.is(200))
      .check(responseTimeInMillis.lt(3000))
  )

  // User journey combining multiple actions
  val invoiceJourney = scenario("Invoice User Journey")
    .exec(authenticate)
    .pause(1)
    .exec(listInvoices)
    .pause(500.milliseconds, 2.seconds)
    .exec(createInvoice)
    .pause(500.milliseconds)
    .exec(getInvoiceDetail)
    .pause(1.second)
    .exec(getDashboardKpis)

  // Read-heavy scenario (80% reads, 20% writes)
  val mixedWorkload = scenario("Mixed Workload")
    .exec(authenticate)
    .repeat(10) {
      randomSwitch(
        80.0 -> exec(listInvoices).pause(500.milliseconds),
        20.0 -> exec(createInvoice).pause(1.second)
      )
    }

  // Spike test scenario
  val spikeTest = scenario("Spike Test")
    .exec(authenticate)
    .exec(listInvoices)
    .exec(getDashboardKpis)

  // Load test setup
  setUp(
    // Normal load test
    invoiceJourney.inject(
      rampUsers(users).during(duration.seconds)
    ),
    // Mixed workload
    mixedWorkload.inject(
      constantUsersPerSec(2).during(duration.seconds)
    )
  ).protocols(httpProtocol)
    .assertions(
      // Global assertions
      global.responseTime.max.lt(5000),     // Max response time < 5s
      global.responseTime.mean.lt(1000),    // Mean response time < 1s
      global.successfulRequests.percent.gt(95), // >95% success rate
      // Per-request assertions
      details("List Invoices").responseTime.percentile(95).lt(2000),
      details("Create Invoice").responseTime.percentile(95).lt(3000),
      details("Dashboard KPIs").responseTime.percentile(95).lt(3000)
    )
}

/**
 * Stress test simulation - pushes system to limits
 */
class StressTestSimulation extends Simulation {

  val baseUrl = System.getProperty("baseUrl", "http://localhost:8080")

  val httpProtocol = http
    .baseUrl(baseUrl)
    .acceptHeader("application/json")
    .contentTypeHeader("application/json")

  val authenticate = exec(
    http("Authenticate")
      .post("/api/authenticate")
      .body(StringBody("""{"username":"admin","password":"admin123"}"""))
      .check(status.is(200))
      .check(jsonPath("$.token").saveAs("authToken"))
  )

  val stressScenario = scenario("Stress Test")
    .exec(authenticate)
    .repeat(5) {
      exec(
        http("Heavy Query")
          .get("/api/reports/profit-loss?startDate=2024-01-01&endDate=2024-12-31")
          .header("Authorization", "Bearer ${authToken}")
          .check(status.in(200, 503)) // Accept 503 under stress
      ).pause(100.milliseconds)
    }

  setUp(
    stressScenario.inject(
      // Ramp up to breaking point
      incrementUsersPerSec(5)
        .times(10)
        .eachLevelLasting(30.seconds)
        .separatedByRampsLasting(10.seconds)
        .startingFrom(5)
    )
  ).protocols(httpProtocol)
}

/**
 * Soak test simulation - sustained load over time
 */
class SoakTestSimulation extends Simulation {

  val baseUrl = System.getProperty("baseUrl", "http://localhost:8080")
  val soakDuration = Integer.getInteger("soakDuration", 3600).toInt // 1 hour default

  val httpProtocol = http
    .baseUrl(baseUrl)
    .acceptHeader("application/json")
    .contentTypeHeader("application/json")

  val authenticate = exec(
    http("Authenticate")
      .post("/api/authenticate")
      .body(StringBody("""{"username":"admin","password":"admin123"}"""))
      .check(status.is(200))
      .check(jsonPath("$.token").saveAs("authToken"))
  )

  val soakScenario = scenario("Soak Test")
    .exec(authenticate)
    .forever {
      exec(
        http("List Invoices")
          .get("/api/invoices?page=0&size=20")
          .header("Authorization", "Bearer ${authToken}")
          .check(status.is(200))
      ).pause(2.seconds, 5.seconds)
    }

  setUp(
    soakScenario.inject(
      constantUsersPerSec(5).during(soakDuration.seconds)
    )
  ).protocols(httpProtocol)
    .maxDuration(soakDuration.seconds)
    .assertions(
      global.failedRequests.percent.lt(1), // <1% failure rate
      global.responseTime.percentile(99).lt(5000)
    )
}
