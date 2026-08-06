from sympy.physics.units import nanosecond


class Employee:

    def __init__(self,name,salary):
        self.name=name
        self.salary=salary
        self.new_salary=salary

    def increment(self):

        if(self.salary<50000):
            self.new_salary=self.salary+(10*self.salary)/100

        else:
            self.new_salary=self.salary+(5*self.salary)/100

    def display(self):

        print("NAME:",self.name)
        print("SALARY:",self.salary)
        print("NEW SALARY:",self.new_salary)


name=input("ENTER THE NAME")
salary=int(input("ENTER THE SALARY"))
employee1=Employee(name,salary)
employee1.increment()
employee1.display()
