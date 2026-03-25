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
        #TODO2: Calculate the target from the difficulty
        max_target = 0xFFFF * 256**(0x1D - 3)  
        target = max_target // difficulty
        return target

    def mine_single_worker(self, start_nonce=0, end_nonce=2**32, multi=False):
    # TODO 3: Implement the mining algorithm
        for nonce in range(start_nonce, end_nonce):
            if multi and self.found.is_set():
                return None

            self.block_header.nonce = nonce
            block_hash = self.block_header.hash()

            if int(block_hash, 16) <= self.target:
                with self.lock:
                    if multi and self.found.is_set():
                        return None

                    self.block_header.nonce = nonce
                    self.result = self.block_header

                    if multi:
                        self.found.set()
                        if self.mode == 'multiprocessing':
                            self.result_queue.put(self.block_header)
                            return None

                    return self.block_header

        return None

    def mine_multi_worker(self, nonce_ranges):
        workers = []

        for start_nonce, end_nonce in nonce_ranges:
            w = self.worker(target=self.mine_single_worker, args=(start_nonce, end_nonce, True))
            workers.append(w)
            w.start()

        for w in workers:
            w.join()

        if self.mode == 'multiprocessing':
            if not self.result_queue.empty():
                self.result = self.result_queue.get()

        return self.result