class Student:
    def __init__(self,name,age,marks):
        self.name=name
        self.age=age
        self.marks=marks

student=[]
noo=int(input("ENTER THE NUMBER OF STUDENT"))
for i in range(noo):
    name=input("ENTER THE NAME")
    age=int(input("ENTER THE AGE"))
    marks=int(input("ENTER THE MARKS"))
    obj = Student(name, age, marks)
    student.append(obj)
for j in student:
    print(j.name,j.age,j.marks)