//simple globals and functions test 1
uint8_t g = 34;

int main()
{
    int x = 44 + 2;
    glob();
    x= half (x);
    return x;

}

uint8_t half (uint8_t a)
{
    uint8_t b =a;
	while (b <100)
		b += 10;
    return b;
}

void glob()
{
	g = 100;
	int8_t loc = 45;
	while (g>3)
		g /= 2;
}