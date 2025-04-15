Topic: What is SRE?

SRE is an abbreviation for reliability engineering proposed by Google in 2004, and is an effort to improve the new structure of a site or system.

Reliability is an indicator to measure whether a system can operate normally and continue to provide services \-\> For example, a game whose server often crashes has low reliability. A person who takes technical measures to prevent such things from happening is called an SRE.

There are differences in the skills and work required for SRE and operation and maintenance. When developing a system, development and operation and maintenance are usually done by different groups, and since they do not often interact, differences in perception are likely to occur.

The developer's goal is to develop the system as quickly and accurately as possible, but the operation side continues to operate the service as stably as possible. This is because the developer team tries to shorten the time during development because profits are negative, and this changes the amount of profit. However, if it is shortened, problems often occur during operation and maintenance. Reliability is neglected and development is tried to end for the time being. For example, the server frequently crashes, recovery is not considered, and once it crashes, it takes a long time to recover, and bugs appear even if you make a small change to fix the system. If this is not addressed, the number of service users and repeat customers will decrease. This is where SRE plays an important role.

What does SRE do?

1\. System and cloud development, operation, and environment maintenance  
The work of an SRE engineer includes the development and operation of systems and clouds. By having an SRE engineer take charge of the development and operation of systems and clouds, developers can use a stable development environment.The construction and provision of tools and mechanisms essential for development work is also a part of the SRE engineer's job.

It is also essential to improve security by improving the server environment and improving the performance, development, construction, and maintenance of middleware.

Stability and high performance of infrastructure and middleware environments increase the reliability of websites, services, and applications. In the unlikely event that a malfunction occurs, preparing a patch and making it possible to roll back is also part of the job to develop mechanisms that can respond quickly to malfunctions.

2\. System automation  
System automation is also one of the important work contents that SRE engineers are responsible for. Specifically, examples include automatic log analysis and automatic update tools for spreadsheets.

Automating the system of daily routine tasks can lead to improved work efficiency and reduce the burden on developers. It also prevents human error and is expected to lead to safer system development and operation.

However, the job of an SRE engineer is to optimize system operations. Developers must not depend on SRE engineers. The job of an SRE engineer is to provide mechanisms and tools that improve development efficiency while allowing developers to be independent.

3\. Dealing with problems

Dealing with problems is also an important job for SRE engineers. To be precise, they take measures to prevent problems before they occur.

Before releasing the system, bugs and errors must be resolved, and efforts must be made to prevent problems that may occur after the release. When releasing a system, the biggest concern for developers is that some kind of failure will prevent the release.

SRE engineers deal with bugs and errors before the release, eliminating developers' concerns and creating an environment where they can concentrate on development. Specific examples include the introduction of circuit breakers in preparation for concentrated access and the creation of correction batches. Taking measures in advance can also be said to be effective in ensuring stable operation of the system.

Differences in roles

DevOps (Development \+ Operations)

- Automate the CI/CD pipeline (Continuous Integration / Continuous Deployment)
- Improve collaboration between devs and ops
- Use tools like Jenkins, GitHub Actions, Docker, Kubernetes, etc.
- Ensure faster release cycles and consistent environments

Infrastructure Engineer

- Set up and manage servers, networks, storage, and cloud infrastructure (e.g., AWS, Azure)
- Handle provisioning, configuration, and monitoring
- Ensure the infrastructure is secure, scalable, and reliable

SRE (Site Reliability Engineer)

- Automate manual ops work (reduce toil)
- Monitor and manage SLIs/SLOs, and error budgets
- Build systems that self-heal and scale efficiently
- Conduct postmortems and improve system resilience

Needed Skills in SRE

- Cloud server construction and operation skills
- Web service development and operation skills
- Application development and operation skills
- Network and database knowledge
- Security knowledge
- Communication skills
