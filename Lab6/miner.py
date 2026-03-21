import threading
import multiprocessing

class Miner:
    def __init__(self, block_header, difficulty, mode='threading'):
        self.block_header = block_header
        self.difficulty = difficulty
        self.target = self.difficulty_to_target(difficulty)
        self.mode = mode
        self.result = None

        if self.mode == 'threading':
            self.worker = threading.Thread
            self.lock = threading.Lock()
            self.found = threading.Event()
        elif self.mode == 'multiprocessing':
            self.worker = multiprocessing.Process

            self.lock = multiprocessing.Lock()  
            self.found = multiprocessing.Event()
            self.result_queue = multiprocessing.Queue()
        else:
            raise ValueError("Invalid mode. Choose 'threading' or 'multiprocessing'.")

    def difficulty_to_target(self, difficulty):
        max_target = 0xFFFF * 256**(0x1D - 3)  
        target = max_target // difficulty
        return target

        raise NotImplementedError("TODO 2: Calculate the target from the difficulty")

    def mine_single_worker(self, start_nonce=0, end_nonce=2**32, multi=False):
        # TODO 3: Implement the mining algorithm
        

        raise NotImplementedError("TODO 3: Implement the mining algorithm")

    def mine_multi_worker(self, nonce_ranges):
        # TODO 4: Implement the mining algorithm with multiple workers

        raise NotImplementedError("TODO 4: Implement the mining algorithm with multiple workers")
