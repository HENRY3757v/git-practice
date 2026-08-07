class ShoppingCart:

    def __init__(self, name):
        self.name = name
        self.cart = []

    def add_item(self, item, price, quantity):
        product = {
            "name": item,
            "price": price,
            "quantity": quantity
        }

        self.cart.append(product)
        print("Item Added Successfully")

    def remove_item(self, item):
        if self.cart == []:
            print("Cart is Empty")

        else:
            for product in self.cart:
                if product["name"] == item:
                    self.cart.remove(product)
                    print("Item Removed Successfully")
                    return

            print("Item Not Found")

    def show_cart(self):

        if self.cart == []:
            print("Cart is Empty")
            return

        print("\n----- SHOPPING CART -----")

        for i in range(len(self.cart)):
            product = self.cart[i]

            subtotal = product["price"] * product["quantity"]

            print("\nItem Number:", i + 1)
            print("Name:", product["name"])
            print("Price:", product["price"])
            print("Quantity:", product["quantity"])
            print("Subtotal:", subtotal)

    def total_item(self):

        total_quantity = 0

        for product in self.cart:
            total_quantity += product["quantity"]

        print("TOTAL NUMBER OF ITEMS:", total_quantity)

    def total_price(self):

        total = 0

        for product in self.cart:
            total += product["price"] * product["quantity"]

        print("TOTAL PRICE:", total)


name = input("ENTER CUSTOMER NAME: ")

cart1 = ShoppingCart(name)

while True:

    print("""
1. Add Item
2. Remove Item
3. Show Cart
4. Total Number of Items
5. Total Price
6. Exit
""")

    choice = int(input("ENTER YOUR CHOICE: "))

    match choice:

        case 1:
            item = input("ENTER ITEM NAME: ")
            price = float(input("ENTER PRICE: "))
            quantity = int(input("ENTER QUANTITY: "))

            cart1.add_item(item, price, quantity)

        case 2:
            item = input("ENTER ITEM TO REMOVE: ")
            cart1.remove_item(item)

        case 3:
            print("\nCUSTOMER:", cart1.name)
            cart1.show_cart()

        case 4:
            cart1.total_item()

        case 5:
            cart1.total_price()

        case 6:
            print("Thank you for shopping!")
            break

        case _:
            print("INVALID CHOICE")